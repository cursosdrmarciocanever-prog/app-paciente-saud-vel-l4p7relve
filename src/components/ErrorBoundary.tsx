import { Component, ReactNode, ErrorInfo } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface Props {
  children?: ReactNode
  onRetry?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo)
  }

  public handleRetry = () => {
    this.setState({ hasError: false, error: null })
    if (this.props.onRetry) {
      this.props.onRetry()
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 p-4 text-center bg-white rounded-lg">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-bold text-foreground">Algo deu errado</h2>
          <p className="text-sm text-foreground/70">
            Ocorreu um erro inesperado ao carregar o chat.
          </p>
          <Button onClick={this.handleRetry} variant="default">
            Tentar Novamente
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
