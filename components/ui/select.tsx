import React from 'react'
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

interface SelectProps {
    label: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
}

const SelectComponent = ({ label, options, value, onChange }: SelectProps): React.ReactElement => {
    const id = React.useId(); // genera id único por instancia
    const labelId = `select-label-${id}`;

    const handleChange = (event: SelectChangeEvent<string>) => {
        const val = event.target.value as string;
        onChange(val);
    };

    return (
        //con colores de la aplicación
        <FormControl 
            variant='standard' 
            fullWidth         
            sx={{
                '& .MuiInput-underline:after': {
                    borderBottomColor: '#8b5cf6', //violet-500
                },
                '& .MuiInput-underline:before': {
                    borderBottomColor: 'lightgray',
                },
                '& .MuiSelect-icon': {
                    color: '#8b5cf6', //violet-500  
                },
                '&:focus': {
                    color: '#8b5cf6', //violet-500  
                },          
            }}
        >
            <InputLabel sx={{                
                '&.Mui-focused': {
                    color: '#000000', //negro
                },
            }}  id={labelId}>{label}</InputLabel>
            <Select
                labelId={labelId}
                value={value}
                label={label}
                onChange={handleChange}
                
            >
                {options.map((option) => (
                    <MenuItem
                        key={option.value}
                        value={option.value}
                        color='green'
                    >
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}

export default SelectComponent;