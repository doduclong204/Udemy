package com.education.udemy.mapper;

import com.education.udemy.dto.response.wishlist.WishlistResponse;
import com.education.udemy.entity.Wishlist;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = "spring")
public interface WishlistMapper {

    @Mapping(source = "course.id", target = "courseId")
    @Mapping(source = "course.title", target = "title")
    @Mapping(source = "course.thumbnail", target = "thumbnail")
    @Mapping(source = "course.discountPrice", target = "price")
    @Mapping(source = "course.price", target = "oldPrice")
    WishlistResponse toWishlistResponse(Wishlist wishlist);

    List<WishlistResponse> toWishlistResponseList(List<Wishlist> wishlists);
}