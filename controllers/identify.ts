import { Request, Response } from "express";
import { Contact, ContactResponse } from "../models/contact";
import { Op } from "sequelize";

export const handleContacts = async (req: Request, res: Response) => {
  // Implement basic error handling: check for missing email or phone number
  if (!req.body.email && !req.body.phoneNumber) {
    res.sendStatus(422);
    return;
  }

  // Call functions to handle primary ID retrieval and contact operations
  const { primaryId, secondaryId } = await getPrimaryIds(
    req.body.email,
    req.body.phoneNumber
  );
  let contacts = await handleContactActions(primaryId, secondaryId, req.body);

  const response = getResponse(contacts);
  res.json({
    contact: response,
  });
};

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

async function handleContactActions(
  primaryId: number | null,
  secondaryId: number | null,
  reqBody: any
) {
  let contacts: Contact[] = [];

  if (primaryId && secondaryId) {
    const connectedContactId = await connectContacts(primaryId, secondaryId);
    if (connectedContactId) {
      const updatedContacts = await getContacts(connectedContactId);
      contacts.push(...updatedContacts);
    }
  } else if (primaryId) {
    const existingContacts = await getContacts(primaryId);
    contacts.push(...existingContacts);
  } else {
    const newContact = await insertNewContact(
      req.body.email,
      req.body.phoneNumber,
      null
    );
    if (newContact instanceof Error) {
      console.log(newContact);
    } else {
      contacts.push(newContact);
    }
  }

  return contacts;
}

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
