import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from '../components/Layout/Layout';

export function LayoutRoute() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
