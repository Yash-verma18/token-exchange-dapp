import Link from "next/link";
import Image from "next/image";
import logo from "../public/Images/logo.png";
import eth from "../public/Images/eth.svg";
export default function MenuTitle() {
  return (
    <div className="flex items-center justify-center gap-1">
      <Image src={logo} alt="logo" width={30} height={30} />
      <h4>Dapp Token Exchange</h4>
    </div>
  );
}
