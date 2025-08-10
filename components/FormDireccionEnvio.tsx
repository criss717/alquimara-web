//formulario para direccion de envío del cliente
export default function FormDireccionEnvio() {
    return (
        <form>
            <div>
                <label htmlFor="nombre">Nombre:</label>
                <input type="text" id="nombre" name="nombre" required />
            </div>
            <div>
                <label htmlFor="direccion">Dirección:</label>
                <input type="text" id="direccion" name="direccion" required />
            </div>
            <div>
                <label htmlFor="ciudad">Ciudad:</label>
                <input type="text" id="ciudad" name="ciudad" required />
            </div>
            <div>
                <label htmlFor="codigo-postal">Código Postal:</label>
                <input type="text" id="codigo-postal" name="codigo-postal" required />
            </div>
            <button type="submit">Guardar Dirección</button>
        </form>
    );
}
