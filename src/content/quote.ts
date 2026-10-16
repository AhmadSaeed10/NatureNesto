import { services } from "./services";

// Request a quote microcopy written for the rebuild. flag: client to review wording.
export const quote = {
  flag: "Quote form copy written for the rebuild. Client to review.",
  eyebrow: "Request a quote",
  title: "Tell us what you need",
  intro:
    "Pick a service and share a few details. We will open WhatsApp with your request ready to send, and our team will reply there.",
  fields: {
    service: { label: "Service", options: services.map((service) => service.title) },
    name: { label: "Your name" },
    area: { label: "City and area", hint: "For example: DHA Phase 6, Lahore" },
    phone: { label: "Phone number" },
    message: { label: "Anything else we should know? (optional)" },
  },
  errors: {
    service: "Please choose a service.",
    name: "Please enter your name.",
    area: "Please enter your city and area.",
    phone: "Please enter a valid phone number.",
    summary: "Please check the highlighted fields.",
  },
  selectPlaceholder: "Choose a service",
  submit: "Send on WhatsApp",
  sent: {
    title: "WhatsApp is ready",
    body: "We opened WhatsApp with your request filled in. Just press send there. If it did not open, use the button below.",
    again: "Open WhatsApp again",
    edit: "Edit request",
  },
  // Lines of the prefilled WhatsApp message.
  message: {
    greeting: "Hi Nature Nesto, I would like a quote.",
    service: "Service",
    name: "Name",
    area: "Area",
    phone: "Phone",
    details: "Details",
  },
} as const;
