const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="tutor-home-error-state" role="alert">
      <p className="tutor-home-error">{message}</p>
      <button type="button" className="tutor-home-retry" onClick={onRetry}>
        Reintentar
      </button>
    </div>
  )
}

export default ErrorState
