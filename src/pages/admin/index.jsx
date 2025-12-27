import { useEffect } from 'react';

const index = () => {
    useEffect(() => window.location.href='admin/stats', []);
    return <div></div>;
}

export default index;