import type { NextPage } from 'next';
import React from 'react';

import PageNextJs from 'nextjs/PageNextJs';

// const Transactions = dynamic(() => import('ui/pages/Transactions'), { ssr: false });
import Transactions from 'ui/pages/Transactions';

const Page: NextPage = () => {
  return (
    <PageNextJs pathname="/txs">
      <Transactions/>
    </PageNextJs>
  );
};

export default Page;

export { base as getServerSideProps } from 'nextjs/getServerSideProps';
