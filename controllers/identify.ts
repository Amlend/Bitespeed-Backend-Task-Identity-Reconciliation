import { Request, Response } from "express";
import { Contact, ContactResponse } from "../models/contact";
import { Op } from "sequelize";

export const handleContacts = async (req: Request, res: Response) => {
  // 1. Validate Request Body (ensure required fields are present and formatted correctly)
  if (validateRequestBody(req.body)) {
    res.sendStatus(422); // Unprocessable Entity - request body is invalid
    return;
  }

  // 2. Extract primary and secondary IDs from request body (email and phone number)
  let {
    primaryId,
    secondaryId,
  }: { primaryId: number | null; secondaryId: number | null } =
    await getPrimaryIds(req.body.email, req.body.phoneNumber);
  let contacts: Contact[] = []; // Array to store retrieved contacts

  // 3. If both primary and secondary IDs exist, attempt to connect them
  if (primaryId && secondaryId) {
    let id = await connectContacts(primaryId, secondaryId);
    if (!id) {
      res.sendStatus(500); // Internal Server Error - connection failed
      return;
    }
    let updatedContacts = await getContacts(id);
    contacts.push(...updatedContacts); // Add connected contacts to results

    const response = getResponse(contacts); // Format response data
    res.json({
      contact: response,
    });
    return;
  }

  // 4. If only primary ID exists, retrieve existing contacts associated with it
  if (primaryId) {
    let existingContacts = await getContacts(primaryId);
    contacts.push(...existingContacts);
  }

  // 5. Handle scenario where request body lacks email or phone number
  if (req.body.email === null || req.body.phoneNumber === null) {
    if (primaryId) {
      const response = getResponse(contacts); // Format response data (if primary ID exists)
      res.json({
        contact: response,
      });
      return;
    } else {
      res.sendStatus(500);
    }
  }

  // 6. If no IDs found, insert a new contact using request body data (email and phone number)
  let result: any = await insertNewContact(
    req.body.email,
    req.body.phoneNumber,
    primaryId
  );
  if (result instanceof Error) {
    console.log(result); // Log any errors during insertion
  } else {
    contacts.push(result); // Add newly inserted contact to results
  }

  const response = getResponse(contacts); // Format response data
  res.json({
    contact: response,
  });
};

// Function to validate request body
const validateRequestBody = (body: any) => {
  return body.email === null && body.phoneNumber === null;
};

// Function to retrieve primary contact IDs based on email and phone number.
async function getPrimaryIds(email: string, phoneNumber: string) {
  let id1: number | null = null;
  let id2: number | null = null;

  if (email) {
    const contact1 = await Contact.findOne({
      where: { email: email },
    });

    id1 = getPrimaryIdFromContact(contact1);
  }

  if (phoneNumber) {
    const contact2 = await Contact.findOne({
      where: { phoneNumber: phoneNumber },
    });

    if (id1) {
      id2 = getPrimaryIdFromContact(contact2);
    } else {
      id1 = getPrimaryIdFromContact(contact2);
    }
  }

  if (id1 && id2) {
    if (id1 === id2) {
      return { primaryId: id1, secondaryId: null };
    } else {
      return { primaryId: id1, secondaryId: id2 };
    }
  } else {
    return { primaryId: id1, secondaryId: null };
  }
}

const getPrimaryIdFromContact = (contact: Contact | null) => {
  if (contact) {
    if (contact.linkPrecedence === "primary") {
      return contact.id;
    } else if (contact.linkedId) {
      return contact.linkedId;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

/* Function to retrieve both contacts using their primary keys
 Determines the primary contact based on the creation date.
 The secondary contact's linkedId and linkPrecedence are updated to point to the primary contact.
 Finally, the primary contact's ID is returned. */
async function connectContacts(pid: number, sid: number) {
  let contact1 = await Contact.findByPk(pid);
  let contact2 = await Contact.findByPk(sid);

  let primaryContact: Contact;
  let secondaryContact: Contact;

  if (contact1 && contact2) {
    if (contact1.createdAt < contact2.createdAt) {
      primaryContact = contact1;
      secondaryContact = contact2;
    } else {
      primaryContact = contact2;
      secondaryContact = contact1;
    }
  } else {
    const error = new Error(
      `Error: unable to fetch primary contacts with primary keys ${pid}, ${sid}`
    );
    console.log(error);
    return null;
  }

  await Contact.update(
    {
      linkedId: primaryContact.id,
      linkPrecedence: "secondary",
    },
    {
      where: {
        [Op.or]: [
          { linkedId: secondaryContact.id },
          { id: secondaryContact.id },
        ],
      },
    }
  );

  return primaryContact.id;
}

/* This function retrieves all contacts related to the provided primary ID.
  It uses the Sequelize Op.or operator to find contacts where either the id or the linkedId matches the primary ID.
  It then iterates through the retrieved rows and adds them to the contacts array. */
async function getContacts(primaryId: number) {
  const rows = await Contact.findAll({
    where: {
      [Op.or]: [{ id: primaryId }, { linkedId: primaryId }],
    },
  });

  let contacts: Contact[] = [];
  rows.forEach((contact) => {
    contacts.push(contact);
  });

  return contacts;
}

/* This function creates a new contact based on the provided email, phone number, and (optional) linked ID.
  It sets the linkPrecedence based on whether a linked ID is provided. */
async function insertNewContact(
  email: string,
  phoneNumber: string,
  linkedId: number | null
) {
  let precedence: string = "primary";
  if (linkedId) {
    precedence = "secondary";
  }

  try {
    const result = await Contact.create({
      phoneNumber: phoneNumber,
      email: email,
      linkedId: linkedId,
      linkPrecedence: precedence,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
    return result;
  } catch (error) {
    return error;
  }
}

/* This function processes the retrieved contacts and builds the response object.
  It iterates through the contacts and identifies the primary contact based on the linkPrecedence.
  It collects unique emails, phone numbers, and secondary contact IDs into sets and then converts them to arrays. */
const getResponse = (contacts: Contact[]) => {
  let response: ContactResponse = {
    primaryContatctId: NaN,
    emails: [],
    phoneNumbers: [],
    secondaryContactIds: [],
  };

  let emails = new Set<string>();
  let phoneNumbers = new Set<string>();
  let secondaryContactIds = new Set<number>();

  contacts.forEach((contact) => {
    if (contact && contact.linkPrecedence === "primary") {
      response.primaryContatctId = contact.id;
    } else if (contact) {
      secondaryContactIds.add(contact.id);
    }

    if (contact && contact.email) {
      emails.add(contact.email);
    }

    if (contact && contact.phoneNumber) {
      phoneNumbers.add(contact.phoneNumber);
    }
  });

  response.emails = [...emails];
  response.phoneNumbers = [...phoneNumbers];
  response.secondaryContactIds = [...secondaryContactIds];

  return response;
};
