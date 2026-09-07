import React from 'react';
import {createRoot} from 'react-dom/client';
import {PrivyProvider, usePrivy} from '@privy-io/react-auth';
import {toSolanaWalletConnectors} from '@privy-io/react-auth/solana';

const cn = document.documentElement.lang === 'zh-CN';
const tr = (en, zh) => cn ? zh : en;
class Boundary extends React.Component {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  render() {return this.state.failed ? <span role="alert">{tr('Login unavailable. Reload to retry.', '登录暂不可用，请刷新重试。')}</span> : this.props.children;}
}
function Login() {
  const {ready, authenticated, user, login, logout} = usePrivy();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  async function exit() {
    setBusy(true); setError('');
    try {await logout();} catch {setError(tr('Sign out failed. Please retry.', '退出失败，请重试。'));}
    finally {setBusy(false);}
  }
  const address = user?.wallet?.address;
  const label = address ? address.slice(0, 6) + '…' + address.slice(-4) : tr('Signed in', '已登录');
  return <div style={{display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap'}}>
    {authenticated && <span title={address || ''}>{label}</span>}
    <button type="button" disabled={!ready || busy} onClick={authenticated ? exit : () => {setError(''); try {login();} catch {setError(tr('Login unavailable.', '登录暂不可用。'));}}}>
      {!ready ? tr('Loading login…', '正在加载登录…') : busy ? tr('Signing out…', '正在退出…') : authenticated ? tr('Sign out', '退出登录') : tr('Log in / Sign up', '登录 / 注册')}
    </button>
    {error && <span role="alert">{error}</span>}
  </div>;
}
const host = document.createElement('div');
host.id = 'wave-privy-login';
const header = document.querySelector('header .tools');
if (header) {
  header.append(host);
  createRoot(host).render(<Boundary><PrivyProvider appId="cmtqzqyaj00zg0el2u2rsp2a6" config={{
    loginMethods: ['email', 'wallet'],
    appearance: {theme: 'dark', accentColor: '#53ded6', walletChainType: 'ethereum-and-solana'},
    externalWallets: {solana: {connectors: toSolanaWalletConnectors()}}
  }}><Login /></PrivyProvider></Boundary>);
}
