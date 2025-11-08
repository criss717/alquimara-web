export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
    return (
        <label
            className="block mb-2 text-sm font-medium text-gray-700"
            {...props}
        />
    );
}