import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

export type ButtonVariant = "primary" | "secondary" | "link";

interface BaseProps {
  variant?: ButtonVariant;
  withArrow?: boolean;
  className?: string;
  children: ReactNode;
}

type LinkButtonProps = BaseProps &
  Omit<ComponentProps<typeof Link>, keyof BaseProps | "href"> & { href: string };

type NativeButtonProps = BaseProps &
  Omit<ComponentProps<"button">, keyof BaseProps> & { href?: undefined };

export type ButtonProps = LinkButtonProps | NativeButtonProps;

const BASE =
  "group relative isolate inline-flex min-h-(--size-tap) items-center justify-center gap-2 font-medium whitespace-nowrap transition-transform duration-(--duration-micro) ease-brand active:scale-[0.98]";

// Fill wipe: an ink layer scales in from the left on hover and keyboard focus.
const WIPE =
  "overflow-hidden rounded-pill px-6 before:absolute before:inset-0 before:-z-10 before:origin-right before:scale-x-0 before:bg-ink before:transition-transform before:duration-(--duration-micro) before:ease-brand before:content-[''] hover:before:origin-left hover:before:scale-x-100 focus-visible:before:origin-left focus-visible:before:scale-x-100";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: cn(WIPE, "bg-primary-dark text-background"),
  secondary: cn(
    WIPE,
    "border border-ink text-ink transition-colors hover:text-background focus-visible:text-background",
  ),
  link: "text-primary-dark after:absolute after:inset-x-0 after:bottom-2 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-(--duration-micro) after:ease-brand after:content-[''] hover:after:scale-x-100 focus-visible:after:scale-x-100",
};

function Content({ children, withArrow }: Pick<BaseProps, "children" | "withArrow">) {
  return (
    <>
      <span>{children}</span>
      {withArrow ? (
        <Icon
          name="arrow-right"
          size={18}
          className="transition-transform duration-(--duration-micro) ease-brand group-hover:translate-x-1 group-focus-visible:translate-x-1"
        />
      ) : null}
    </>
  );
}

export function Button(props: ButtonProps) {
  const { variant = "primary", withArrow = false, className, children } = props;
  const classes = cn(BASE, VARIANTS[variant], className);

  if (props.href !== undefined) {
    const {
      variant: _v,
      withArrow: _a,
      className: _c,
      children: _ch,
      ...linkProps
    } = props as LinkButtonProps;
    return (
      <Link {...linkProps} className={classes}>
        <Content withArrow={withArrow}>{children}</Content>
      </Link>
    );
  }

  const {
    variant: _v,
    withArrow: _a,
    className: _c,
    children: _ch,
    href: _h,
    type = "button",
    ...buttonProps
  } = props;
  return (
    <button {...buttonProps} type={type} className={classes}>
      <Content withArrow={withArrow}>{children}</Content>
    </button>
  );
}
