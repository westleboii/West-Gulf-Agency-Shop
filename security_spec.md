# Security Specification — West Gulf Agency Shop

## 1. Data Invariants
1. **Global Default Deny**: Any unmatched path is strictly denied (`allow read, write: if false;`).
2. **Verified Identity**: All write operations require an authenticated user with `request.auth.token.email_verified == true`.
3. **Admin Verification**: Administrator status (`isAdmin()`) requires either an explicit document in `/admins/$(request.auth.uid)` or the verified runtime owner email (`juniorndime@gmail.com` with `email_verified == true`).
4. **PII Isolation**: `/users/{userId}`, `/users/{userId}/addresses/{addressId}`, and `/orders/{orderId}` contain customer PII (email, phone, shipping address) and can only be read by the document owner (`request.auth.uid == userId`) or an administrator (`isAdmin()`).
5. **Relational Master Gate**:
   - A `ShippingAddress` in `/users/{userId}/addresses/{addressId}` can only be accessed or mutated if the parent `/users/{userId}` document exists and belongs to `request.auth.uid`.
   - A `Review` in `/products/{productId}/reviews/{reviewId}` can only be created or updated if the parent `/products/{productId}` document exists.
6. **Terminal State Locking**: Once an `Order` reaches `status == 'delivered'` or `status == 'cancelled'`, non-admin users cannot mutate it.
7. **Temporal Integrity**: All `createdAt` and `updatedAt` timestamps must match `request.time`, and `createdAt`, `uid`, `userId`, `authorId`, and `productId` are immutable on update.

## 2. The "Dirty Dozen" Payloads
1. **Shadow Field Injection on UserProfile**: Adding `"isAdmin": true` to `/users/{userId}` creation. Rejected by `hasOnly()`.
2. **Unverified Admin Email Spoof**: Calling admin update on `/orders/{orderId}` with `email: "juniorndime@gmail.com"` and `email_verified: false`. Rejected by `isVerified()`.
3. **PII Cross-User Read**: Authenticated user `userB` attempting `get` on `/users/userA`. Rejected by `isOwner(userId) || isAdmin()`.
4. **Orphaned Address Creation**: Creating `/users/userA/addresses/addr1` when `/users/userA` does not exist. Rejected by `exists(/databases/$(database)/documents/users/$(userId))`.
5. **Non-UAE Emirate Injection**: Creating an order with `emirate: "London"`. Rejected by `isValidEmirate()`.
6. **ID Poisoning Attack**: Creating a document with a 500-character ID or special characters `id_with_$paces`. Rejected by `isValidId()`.
7. **Value Poisoning on Update**: Updating `loyaltyPoints` on `/users/{userId}` with a string `"999999"`. Rejected by `isValidUserProfile(incoming())`.
8. **Terminal Order Mutation**: Customer attempting to cancel an order whose `status` is already `'delivered'`. Rejected by terminal state lock.
9. **Client Timestamp Forgery**: Creating an order where `createdAt` is a past or future timestamp instead of `request.time`. Rejected by `incoming().createdAt == request.time`.
10. **Immutable Owner Swap**: Updating `userId` on `/orders/{orderId}` to transfer ownership. Rejected by `incoming().userId == existing().userId`.
11. **Unbounded String DoS**: Submitting a product review with a 10,000-character `comment`. Rejected by `data.comment.size() <= 600`.
12. **Unauthorized Catalog Price Manipulation**: Regular customer attempting to create or update `/products/{productId}`. Rejected by `isAdmin()`.

## 3. Test Runner Specification
Verified via `src/security/firestore.rules.test.ts` validating schema boundaries, role isolation, and Dirty Dozen rejections.
