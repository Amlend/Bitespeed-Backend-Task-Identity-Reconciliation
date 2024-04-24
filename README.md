## Bitespeed Backend Task: Identity Reconciliation

This document provides an overview of the functionality and usage of the Identity Reconciliation application written in TypeScript.

Hosted link: [https://bitespeed-backend-task-identity-8pe8.onrender.com](https://bitespeed-backend-task-identity-8pe8.onrender.com)

**Features**

- Connect Contacts: Establish links between two contacts based on their email address or phone number. One contact becomes the "primary" contact, while the other becomes "secondary." Their information is linked for efficient management.
- Retrieve Contacts: Fetch all contact details associated with a primary contact ID. This includes both the primary contact and any secondary contacts linked to it.
- Create Contacts: Generate new contacts by providing their email address and/or phone number. If a new contact is linked to an existing contact during creation, it will be marked as "secondary."

**API Endpoint**

The application offers a RESTful API endpoint, likely defined in a file named `contacts.ts` or similar. This endpoint handles requests for various contact management functionalities.

**API Request**

**Example (using fetch):**

```typescript
// Interface for request body
interface ContactRequestBody {
  email?: string;
  phoneNumber?: string;
}

fetch("/identify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com", // Optional
    phoneNumber: "+1234567890", // Optional
  }),
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

**API Response**

The API endpoint responds with a JSON object containing the contact information:

```typescript
{
  "contact": {
    "primaryContatctId": 123,
    "emails": ["user@example.com"],
    "phoneNumbers": ["+1234567890"],
    "secondaryContactIds": [456]
  }
}
```

- primaryContatctId: The ID of the primary contact.
- emails: An array containing all email addresses associated with the contacts (primary and any linked secondary contacts).
- phoneNumbers: An array containing all phone numbers associated with the contacts (primary and any linked secondary contacts).
- secondaryContactIds: An array containing the IDs of any secondary contacts linked to the primary contact.

**Error Handling**

- The API endpoint handles errors gracefully, including missing email or phone number in the request body, or database errors during contact creation or retrieval.
- Specific error codes and messages are returned to aid in debugging and troubleshooting.

**Models**

The application likely utilizes TypeScript interfaces or classes to define the structure of contact data:

```typescript
interface Contact {
  id: number;
  email?: string;
  phoneNumber?: string;
  linkedId?: number;
  linkPrecedence: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

**Running the application**

**Prerequisites:**

- Node.js and npm installed on your system.

**Steps:**

- Clone or download the application codebase.

- Navigate to the project directory in your terminal.

- Install dependencies:

```
npm install
```

```
tsc
```

```
npm start
```

This will typically start the server on a port like localhost:3000 (check the code for the specific port).

**API Usage**

Once the server is running, you can use tools like Postman or make API requests directly from your code to interact with the contact management endpoints. Refer to the codebase for specific API endpoint definitions and request/response structures.
