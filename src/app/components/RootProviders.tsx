'use client';
import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/app/store/store';
import PrivyProviders from './PrivyProvider';

export default function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PrivyProviders>{children}</PrivyProviders>
    </Provider>
  );
}