import './ventanaEmerjente.css'

const VentanaEmerjente = ({
  text,
  textBtn1,
  textBtn2,
  handleClickBtn1,
  handleClickBtn2,
}) => {
  return (
    <div className="overlay-modal">
      <div className="ventana-emergente">
        <p>{text}</p>

        <div className="modal-actions">
          <button type="button" onClick={handleClickBtn1}>
            {textBtn1}
          </button>

          {textBtn2 ? (
            <button type="button" className="secondary" onClick={handleClickBtn2}>
              {textBtn2}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default VentanaEmerjente
