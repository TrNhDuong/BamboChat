# Database Schema: BamboChat System (MongoDB/Mongoose)

This document describes the NoSQL database structure implemented via Mongoose for the BamboChat messaging system. The design leverages MongoDB features such as TTL indexes and Sparse indexes for optimal performance.

---

## 1. Users & Authentication (Collections: Users & OTPs)

### Collection `Users`
Stores primary identitiy and profile data. The custom `_id` is the user's chosen unique ID (String).

| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | String (**PK**) | Unique username/ID (Max 50 chars) |
| `email` | String | Email for OTP/OAuth (Unique, Indexed) |
| `passwordHash` | String | Bcrypt hashed password |
| `isVerified` | Boolean | Verification status (Default: false) |
| `displayName` | String | Name displayed on the UI |
| `bio` | String | Short user bio/introduction |
| `avatar` | Object | `{ url, public_id }` for Cloudinary storage |
| `googleId` | String | Google OAuth ID (Unique, Sparse Indexed) |

* **Indexes:** `unique: true` on `email`, `sparse: true` on `googleId`.

### Collection `OTPs`
Manages short-term verification codes. Automatically expires via TTL Index.

| Field | Type | Description |
| :--- | :--- | :--- |
| `email` | String | Recipient email (Indexed) |
| `otpCode` | String | 6-digit verification code |
| `expiresAt` | Date | Expiration timestamp |
| `attempts` | Number | Failed attempt counter (Default: 0) |

* **Indexes:** `idx_otps_email`, TTL index on `expiresAt`.

---

## 2. Relationships (Collection: Friendships)

Stores the social graph between users.

| Field | Type | Description |
| :--- | :--- | :--- |
| `requesterId` | String (**FK**) | User who sent the request |
| `addresseeId` | String (**FK**) | Recipient of the request (Indexed) |
| `status` | Enum | `pending`, `accepted`, `blocked` |

* **Indexes:** Composite Unique `{ requesterId, addresseeId }` to prevent duplicate requests.

---

## 3. Messaging (Collections: Conversations, Participants, Messages)

### Collection `Conversations`
Represents chat rooms/sessions.

| Field | Type | Description |
| :--- | :--- | :--- |
| `type` | Enum | `direct_message`, `group` |
| `name` | String | Group name (Null for direct messages) |

### Collection `Participants`
Links users to conversations and tracks read status/roles.

| Field | Type | Description |
| :--- | :--- | :--- |
| `conversationId`| ObjectId(**FK**) | ID of the conversation |
| `userId` | String (**FK**) | ID of the user (Indexed) |
| `lastReadMessageId`| String | ID of the last message read by the user |
| `role` | Enum | `admin`, `member` (Controls kick/manage permissions) |

* **Indexes:** Composite Unique `{ conversationId, userId }`.

### Collection `Messages`
Stores message content. Uses UUIDv7 for natural time-based sorting.

| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | String (**PK**) | Primary Key (UUIDv7 - Time sortable) |
| `conversationId`| ObjectId(**FK**) | Parent conversation (Indexed) |
| `senderId` | String (**FK**) | Message sender |
| `content` | String | Text content |

* **Indexes:** Compound index `{ conversationId: 1, _id: -1 }` for optimized pagination.

---

## 4. Technical Highlights

1.  **UUIDv7 & Pagination:** The `Messages` collection uses UUIDv7 instead of the default ObjectId. This ensures messages are sortable by generation time across distributed systems, enabling smooth **Cursor-based Pagination**.
2.  **Watermark Read Receipts:** Read status is not stored per message. Instead, the `lastReadMessageId` pointer in the `Participants` collection acts as a "watermark."
3.  **Custom _id:** Using a custom String `_id` for `Users` allows for direct and rapid lookups based on the unique username chosen by the user.
