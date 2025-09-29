import { ShippingFull } from "@/types/shippingFormData"
import { Checkbox, FormControlLabel } from "@mui/material"
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';

interface CardDireccionesProps {
    direccion: ShippingFull;
    onChangeActive: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
}

export default function CardDirecciones({
    direccion,
    onChangeActive,
    onDelete,
    onEdit
}: CardDireccionesProps) {
    return (
        <div key={direccion.id} className="border p-4 mb-4 flex h-[160px] ">
            <div className="h-full w-11/12" >
                <h3 className="font-bold">{direccion.full_name}</h3>
                <p>{direccion.address}</p>
                <p>{direccion.city}, {direccion.postal_code}</p>
                <p>{direccion.phone}</p>
                <p>{direccion.email}</p>
            </div>
            <div className="h-full w-1/12 items-center justify-between flex flex-col">
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={direccion.active}
                            onChange={() => !direccion.active && onChangeActive(direccion.id)}
                            sx={{ '&.Mui-checked': { color: '#7C3AED' } }}
                        />
                    }
                    label=""
                />
                <div className="h-full w-full flex items-center justify-center gap-2">
                    <button
                        onClick={() => onEdit(direccion.id)}
                        className="text-black-500 hover:text-violet-500 cursor-pointer"
                    >
                        <EditTwoToneIcon />
                    </button>
                    <button
                        onClick={() => onDelete(direccion.id)}
                        className="text-red-800 hover:text-red-500 cursor-pointer"
                    >
                        <DeleteForeverTwoToneIcon />
                    </button>
                </div>
            </div>
        </div>
    );
}