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
