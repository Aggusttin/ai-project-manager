interface Props {
  activo: boolean;
}

export const ProyectoStatusBadge = ({ activo }: Props) => {
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
      activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  );
};