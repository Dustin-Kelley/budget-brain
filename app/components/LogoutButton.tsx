'use client'
import { LogOut } from 'lucide-react'
import React from 'react'
import { signOutAction } from '../actions'
import { Button } from '@/components/ui/button';
export default function LogoutButton() {
  return (
    <Button variant='destructive' onClick={() => signOutAction()}>
      <LogOut />
      <span>Logout</span>
    </Button>
  );
}
