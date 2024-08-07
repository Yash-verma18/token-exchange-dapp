import Link from 'next/link';
import Image from 'next/image';
import logo from '../public/Images/logo.png';
import eth from '../public/Images/eth.svg';
export default function MenuTitle() {
  return (
    <div className='flex items-center justify-center gap-2 mt-2 overflow-auto px-4'>
      <Image src={logo} alt='logo' width={20} height={20} />
      <h4 className='text-primary  text-xl font-bold'>Dapp Token Exchange</h4>
    </div>
  );
}
