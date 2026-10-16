import { motion } from "motion/react";

// Static map so polymorphic primitives never create motion components during render.
export const MOTION_TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  header: motion.header,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
  p: motion.p,
  span: motion.span,
} as const;

export type MotionTag = keyof typeof MOTION_TAGS;
