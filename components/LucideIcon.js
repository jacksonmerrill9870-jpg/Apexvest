import { icons } from "lucide-react";

const kebabToPascal = (str) => {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
};

export default function LucideIcon({ name, className = "", style = {} }) {
  const IconComponent = icons[kebabToPascal(name)];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }

  return <IconComponent className={className} style={style} />;
}
