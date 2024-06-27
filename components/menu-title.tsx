import Link from "next/link";

export default function MenuTitle() {
  return (
    <Link href="/">
      <h4 className="flex items-center">Manage</h4>
    </Link>
  );
}
