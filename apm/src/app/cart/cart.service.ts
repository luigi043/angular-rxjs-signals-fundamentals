import { effect, Injectable, signal } from "@angular/core";
import { ProductData } from "../products/product-data";
import { Product } from "../products/product";

@Injectable({
  providedIn: 'root'
})
export class CartService {
[x: string]: any;
  cartItems = signal<CartService[]>([]);

  eLength =effect(() = > console.log('Cart arry length:', this .cartItems().length));
  addToCart(product: Product): void {
    this.cartItems().push({ product, quantity: 1 });
  }
}

