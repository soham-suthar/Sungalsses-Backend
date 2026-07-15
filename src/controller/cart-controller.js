import Cart from "../models/cart-model.js";
import Product from "../models/product-model.js";

const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1 } = req.body;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0",
      });
    }

    console.log("Received Product", productId);

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    if (quantity > product.quantity) {
      return res.status(400).json({ message: "Not enough stock" });
    }

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > product.quantity) {
        return res.status(400).json({ message: "Note enough stock" });
      }

      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
      });
    }

    await cart.save();

    return res.status(200).json({ message: "Product added to Cart", cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product", "name src hoverSrc price color section")
      .lean();

    if (!cart) {
      return res.status(200).json({
        items: [],
        totalPrice: 0,
        totalItems: 0,
      });
    }

    let totalItems = 0;
    let totalPrice = 0;

    cart.items.forEach((item) => {
      if (!item.product) {
        return res.status(400).json({
          message: `${item.product.name} is out of stock or has insufficient quantity`,
        });
      }

      totalItems += item.quantity;
      totalPrice += item.product.price * item.quantity;
    });

    return res.status(200).json({
      items: cart.items,
      totalItems,
      totalPrice,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { quantity } = req.body;
    const { id } = req.params;

    if (!Number.isInteger(quantity) || quantity < 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be a non-negative integer" });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find((item) => item.product.toString() === id);

    if (!item) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (quantity === 0) {
      cart.items = cart.items.filter((item) => item.product.toString() !== id);
    } else {
      if (quantity > product.quantity) {
        return res.status(400).json({
          message: "Not enough stock",
        });
      }

      item.quantity = quantity;
    }

    await cart.save();

    return res.status(200).json({ message: "Cart updated successfully", cart });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const { id } = req.params;
    cart.items = cart.items.filter((item) => item.product.toString() !== id);

    await cart.save();

    return res.status(200).json({
      message: "Item removed successfully",
      cart,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    cart.items = [];
    await cart.save();

    return res.status(200).json({
      message: "Cart cleared",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export { addToCart, getCart, updateQuantity, removeFromCart, clearCart };
