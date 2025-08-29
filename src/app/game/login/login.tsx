import styles from './login.module.css';
import Image from 'next/image';
import AuthComponent from '@/app/components/AuthComponent';

export default function LoginForm({ onAddressChange }: { onAddressChange: (address: string) => void }) {
  return (
    <>
      <div className={styles.content}>
        <Image src="/assets/logo.png" alt="Gempire icon" width="86" height="86" />
        <AuthComponent onAddressChange={onAddressChange}></AuthComponent>
      </div>
    </>
  );
}
