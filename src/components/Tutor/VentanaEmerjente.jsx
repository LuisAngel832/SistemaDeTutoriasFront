import './ventanaEmerjente.css'

const VentanaEmerjente = ({ text, textBtn1, handleClickBtn1 }) => {
  return (
    <div className="overlay-modal">
      <div className="ventana-emergente">
        <p>{text}</p>
        <button type="button" onClick={handleClickBtn1}>
          {textBtn1}
        </button>
      </div>
    </div>
  )
}

export default VentanaEmerjente
