'use client'
import { LogOut } from 'lucide-react'
import React from 'react'
import { Button } from '@/components/ui/button';
import { signOut } from '../(auth)/login/actions';
export default function LogoutButton() {
  return (
    <Button variant='destructive' onClick={() => signOut()}>
      <LogOut />
      <span>Logout</span>
    </Button>
  );
}
