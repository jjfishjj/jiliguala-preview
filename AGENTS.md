# Jiliguala contributor guide

## Scope

- Keep the existing brand homepage, course pages, testimonials, and legacy public pages working.
- The learning-method library lives in `methods/`.
- Firebase Authentication and Firestore behavior lives in `methods/firebase-app.js`; access rules live in `firestore.rules`.
- Do not commit `.env*`, `.vercel/`, Firebase CLI credentials, or service-account keys.

## Before pushing

Run these checks from the repository root:

```sh
node --check methods/app.js
node --check methods/firebase-app.js
git diff --check
```

For UI changes, serve the repository locally and verify `/methods/` at desktop and mobile widths. Test signed-out behavior as well as Firebase-backed signed-in behavior when credentials are available.

## GitHub and Vercel

- Create a feature branch for work that needs review, then push it to GitHub. Vercel creates a Preview deployment for the branch or pull request.
- Merge reviewed work into `main`. Vercel deploys `main` to the production domain.
- Include the Vercel Preview URL in the pull request description when a visual review is useful.
- Deploy Firestore rule changes separately with `firebase deploy --only firestore:rules --project jiliguala-methods`.
