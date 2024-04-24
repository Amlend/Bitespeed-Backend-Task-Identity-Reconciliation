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
