import React from 'react';

 class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示出错的fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // 同时你可以把错误日志上报给自己的服务器
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 可以自定义出错后的UI并返回
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;