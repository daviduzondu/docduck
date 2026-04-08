'use client'
import React from "react";

interface Props {
 children: React.ReactNode;
 fallback?: React.ReactNode;
}

interface State {
 hasError: boolean;
 error?: Error;
}

export class LocalErrorBoundary extends React.Component<Props, State> {
 constructor(props: Props) {
  super(props);
  this.state = { hasError: false };
 }

 static getDerivedStateFromError(error: Error): State {
  return { hasError: true, error };
 }

 componentDidCatch(error: Error, info: React.ErrorInfo) {
  console.log(error, info);
 }

 render() {
  if (this.state.hasError) {
   return this.props.fallback ?? <div className="flex w-full bg-red-200 ">
    Failed to get resource</div>;
  }

  return this.props.children;
 }
}