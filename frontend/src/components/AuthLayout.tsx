import { Link } from 'react-router-dom';
import { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle: string;
  bottomLabel: string;
  bottomLinkTo: string;
  bottomLinkText: string;
  children: ReactNode;
};

export function AuthLayout(props: Props) {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="logo">LX</div>
        <h1>{props.title}</h1>
        <p>{props.subtitle}</p>
        {props.children}
        <div className="auth-bottom">
          {props.bottomLabel} <Link to={props.bottomLinkTo}>{props.bottomLinkText}</Link>
        </div>
      </div>
    </div>
  );
}
