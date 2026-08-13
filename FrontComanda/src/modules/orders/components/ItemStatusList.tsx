import { useState, useEffect } from 'react';
import { itemService } from '@/api/items';
import type { ItemQueueApiResponse } from '@/api/items/item.interface';

const ItemStatusList = () => {
  const [items, setItems] = useState([] as ItemQueueApiResponse[]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null as string | null);
  const [selectedStatus, setSelectedStatus] = useState('PENDING');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await itemService.getItemsByStatus(selectedStatus);
        setItems(data);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar itens:', err);
        setError('Falha ao carregar os itens. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [selectedStatus]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div>
        <label htmlFor="status-select">Filtrar por status:</label>
        <select 
          id="status-select" 
          value={selectedStatus} 
          onChange={handleStatusChange}
        >
          <option value="PENDING">Pendente</option>
          <option value="PREPARING">Em Preparo</option>
          <option value="DELIVERED">Entregue</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
      </div>

      <h2>Itens com status: {selectedStatus}</h2>
      
      {items.length === 0 ? (
        <p>Nenhum item encontrado com este status.</p>
      ) : (
        <ul>
          {items.map((item, index) => (
            <li key={index}>
              <div>
                <strong>Mesa:</strong> {item.tableName} | 
                <strong>Usuário:</strong> {item.username} | 
                <strong>Produto:</strong> {item.productName} | 
                <strong>Quantidade:</strong> {item.quantity}
              </div>
              <div>
                <strong>Pedido:</strong> {item.orderId || 'N/A'} | 
                <strong>Status:</strong> {item.status} | 
                <strong>Criado em:</strong> {new Date(item.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ItemStatusList;
