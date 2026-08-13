package me.mindra.mindrabar_api.application.port.in;

import java.math.BigDecimal;
import java.util.List;

import me.mindra.mindrabar_api.application.dto.item.ItemCreateRequestDTO;
import me.mindra.mindrabar_api.application.dto.item.ItemCreateResponseDTO;
import me.mindra.mindrabar_api.application.dto.item.ItemQueueResponseDTO;
import me.mindra.mindrabar_api.application.dto.item.ItemResponseDTO;
import me.mindra.mindrabar_api.application.dto.item.ItemStatusUpdateRequestDTO;
import me.mindra.mindrabar_api.application.dto.item.ItemStatusUpdateResponseDTO;
import me.mindra.mindrabar_api.domain.model.item.ItemStatus;

public interface ManageItemUseCase {

    ItemCreateResponseDTO createItem(ItemCreateRequestDTO request);
    ItemStatusUpdateResponseDTO updateStatus(ItemStatusUpdateRequestDTO request);
    void deleteItem(Long itemId);
    ItemResponseDTO findItemById(Long itemId);
    List<ItemResponseDTO> findAll(Long companyId);
    List<ItemResponseDTO> findItemsByOrder(Long orderId);
    List<ItemResponseDTO> findItemsByUser(Long userId);
    List<ItemResponseDTO> findItemsByProduct(Long productId);
    List<ItemQueueResponseDTO> findItemByStatusAndCompanyId(ItemStatus status, Long companyId);
    BigDecimal getTotalAmount(Long orderId);
}
