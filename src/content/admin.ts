// Admin interface copy written for the rebuild. flag: client to review wording.
export const admin = {
  flag: "Admin interface copy written for the rebuild. Client to review.",
  metaTitle: "Admin",
  login: {
    eyebrow: "Nature Nesto Admin",
    title: "Sign in",
    intro: "For the Nature Nesto team. Use the email address you were invited with.",
    email: "Email",
    password: "Password",
    passwordHint: "Leave empty to get a sign in link by email instead.",
    submitPassword: "Sign in",
    pending: "Please wait",
    linkSent:
      "If this email has access to the admin, a sign in link is on its way. It expires in one hour.",
    errors: {
      email: "Please enter a valid email address.",
      credentials: "That email and password did not match an admin account.",
      rateLimited: "Too many attempts. Please wait a few minutes and try again.",
      notConfigured: "Sign in is not available yet. The admin is still being connected.",
      callback:
        "That sign in link has expired or was opened in a different browser. Please request a new one.",
      notStaff: "This account does not have admin access.",
    },
  },
  home: {
    eyebrow: "Nature Nesto Admin",
    title: "Welcome",
    signedInAs: "Signed in as",
    role: "Role",
    roles: { owner: "Owner", admin: "Admin", editor: "Editor", support: "Support" },
    next: "The admin sections arrive in the next stages: media, settings, products, content, orders and leads.",
    signOut: "Sign out",
    viewSite: "View site",
  },
} as const;
