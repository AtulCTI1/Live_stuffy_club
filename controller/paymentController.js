const Joi = require("joi");
var request = require("request");
// const stripe = require('stripe')('your_api_key_here');
// const stripe = require('stripe')('sk_test_51LEQsRIHjPT5q0q8PJitD60txuwWmuR3BV6W8EnsjlsHmwCwrfTfTLFlQ1bjkHJWgUiq3f0fv0c10ejYoUJGjBtC00zT2d4nFJ');
const stripe = require("stripe")(
  "sk_test_51N1YKlFKunSOaPwDgbiGYdeJ2xaBqgiu3sgxpKgACmblRbvQa0f0WfoPnE6soknAochykJentKkVzwoCS5lIFXMw00E4WOEFZv"
);
// const ffmpeg = require('fluent-ffmpeg');
// const { addpayment, add_payment, update_Status, addcustomer } = require("../models/payment");

const {
  addpayment,
  Get_Purchase_Qrcode, delete_card,
  update_QRcode,add_payment,
  add_payment_QRcode,
  get_token_by_id,
  getProductbyid,
  fetch_product,
  get_token,
  save_CARD,
  update_Status,
  add_payment_1,
  addcustomer,
} = require("../models/payment");


exports.payment = async (req, res) => {
  try {
    const {
      name,
      email,
      card_number,
      exp_month,
      exp_year,
      cvc,
      user_id,
      product_id,
      save_button,
    } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        name: [Joi.string().empty().required()],
        email: [Joi.string().empty().required()],
        card_number: [Joi.string().empty().required()],
        exp_month: [Joi.number().empty().required()],
        exp_year: [Joi.number().empty().required()],
        cvc: [Joi.string().empty().required()],
        save_button: [Joi.string().empty().required()],
        // amount: [Joi.number().empty().required()],
        user_id: [Joi.number().empty().required()],
        product_id: [Joi.number().empty().required()],
      })
    );

    const result = schema.validate(req.body);

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const purchase_qrcode = await Get_Purchase_Qrcode(product_id, user_id);
      console.log(">>>>>>>>>>>>>>>", purchase_qrcode);
      if (purchase_qrcode != 0) {
        return res.json({
          message: " You have already purchased this QR_code. ",
          success: false,
          status: 200,
        });
      } else {
        const get_product_info = await getProductbyid(product_id);
        if (get_product_info != 0) {
          const token = await stripe.tokens.create({
            card: {
              number: card_number,
              exp_month: exp_month,
              exp_year: exp_year,
              cvc: cvc,
            },
          });

          // console.log(token,">>>>>>>>>>")

          const customer = await stripe.customers.create({
            email: email,
            name: name,
            card: token.id,
          });

          const charge = await stripe.charges.create({
            amount: get_product_info[0].price * 100,
            currency: "usd",
            customer: customer.id,
            description: "test payment",
          });

          var token_id = token.id;
          var card_id = customer.default_source;
          var customer_id = customer.id;
          var payment_id = charge.id;
          let fingerprint = token.card.fingerprint
          var QR_code = get_product_info[0].QR_code_image;

          if (charge.status === "succeeded") {
            if (save_button == 1) {
              const save_card = await save_CARD(
                token_id,
                card_id,
                customer_id,
                user_id, fingerprint
              )
            }

            const Payment_id = await add_payment_QRcode(
              payment_id,
              user_id,
              product_id
            );
            const update_QRCode = await update_QRcode(
              user_id,
              product_id,
              QR_code
            );

            return res.json({
              message: "Payment successful",
              payment: charge,
              success: true,
              status: 200,
            });
          } else {
            return res.json({
              message: "Payment Unsuccessful",
              payment: [],
              success: false,
              status: 200,
            });
          }
        } else {
          return res.json({
            message: "No product found",
            payment: [],
            success: false,
            status: 200,
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Internal server error",
      success: false,
      Error: error,
      status: 500,
    });
  }
};

exports.GetTranstion = async (req, res) => {
  try {
    const { Charge_id } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        // amount: [Joi.number().empty().required()],
        // user_id: [Joi.number().empty().required()],
      })
    );

    const result = schema.validate({});

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      stripe.charges
        .retrieve(Charge_id)
        .then((charge) => {
          res.json(charge);
        })
        .catch((error) => {
          res.json(err);
        });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Internal server error",
      success: false,
      status: 500,
    });
  }
};

exports.create_customer = async (req, res) => {
  try {
    const { name, email, user_id } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        name: [Joi.string().empty().required()],
        email: [Joi.string().empty().required()],
        user_id: [Joi.number().empty().required()],
      })
    );

    const result = schema.validate(req.body);

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      stripe.customers
        .create({
          name: name,
          email: email,
          description: "user id = " + user_id,
          // Add more parameters as needed
        })
        .then(async (customer) => {
          res.json(customer);
          const customer_info = {
            customer_id: customer.id,
            user_id: user_id,
          };
          // console.log(">>>>>>>>>>", customer);
          // console.log(">>>>>>>>>>", customer.id);
          const create_customer = await addcustomer(customer_info);
        })
        .catch((error) => {
          res.json(error);
        });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Internal server error",
      success: false,
      status: 500,
    });
  }
};

exports.get_customer_id = async (req, res) => {
  try {
    const { customer_id } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        customer_id: [Joi.string().empty().required()],
      })
    );

    const result = schema.validate({ customer_id });

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const customer = await stripe.customers.retrieve(customer_id);
      //    res.json(customer)
      if (customer != 0) {
        return res.json({
          message: "customer_info",
          success: true,
          status: 200,
          customer_info: customer,
        });
      } else {
        return res.json({
          message: " error",
          success: false,
          status: 400,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Internal server error",
      success: false,
      status: 500,
    });
  }
};

exports.get_all_customer = async (req, res) => {
  try {
    const { customer_id } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        customer_id: [Joi.string().empty().required()],
      })
    );

    const result = schema.validate({ customer_id });

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const customer = await stripe.customers.retrieve(customer_id);
      //    res.json(customer)
      if (customer != 0) {
        return res.json({
          message: "customer_info",
          success: true,
          status: 200,
          customer_info: customer,
        });
      } else {
        return res.json({
          message: " error",
          success: false,
          status: 400,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Internal server error",
      success: false,
      status: 500,
    });
  }
};

exports.create_price = async (req, res) => {
  try {
    // const { product_id, price, interval, currency } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        // product_id: [Joi.string().empty().required()],
        // price: [Joi.number().empty().required()],
        // interval: [Joi.string().empty().required()],
        // currency: [Joi.string().empty().required()],
      })
    );

    const result = schema.validate();

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const price = await stripe.prices
        .create({
          unit_amount: 12000,
          currency: "usd",
          recurring: { interval: "month" },
          product: "prod_O0CP69j4VR484H",
        })

        .then((price) => {
          res.json(price);
        })
        .catch((error) => {
          res.json(error);
        });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Internal server error",
      success: false,
      status: 500,
    });
  }
};

exports.get_price = async (req, res) => {
  try {
    const { price_id } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        product_name: [Joi.string().empty().required()],
        description: [Joi.string().empty().required()],
      })
    );

    const result = schema.validate(req.body);

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const price = await stripe.prices
        .retrieve(price_id)

        .then((price) => {
          res.json(price);
        })
        .catch((error) => {
          res.json(error);
        });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Internal server error",
      success: false,
      status: 500,
    });
  }
};

exports.get_all_price = async (req, res) => {
  try {
    const prices = await stripe.prices
      .list({ limit: 3 })

      .then((price) => {
        res.json(price);
      })
      .catch((error) => {
        res.json(error);
      });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Internal server error",
      success: false,
      status: 500,
    });
  }
};

exports.create_product = async (req, res) => {
  try {
    const { name, description } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        name: [Joi.string().empty().required()],
        description: [Joi.string().empty().required()],
      })
    );

    const result = schema.validate(req.body);

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      stripe.products
        .create({
          name: name,
          description: description,
          // Add more parameters as needed
        })
        .then((product) => {
          res.json(product);
        })
        .catch((error) => {
          res.j(error);
        });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Internal server error",
      success: false,
      status: 500,
    });
  }
};

exports.get_product_id = async (req, res) => {
  try {
    const { product_id } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        product_id: [Joi.string().empty().required()],
      })
    );

    const result = schema.validate(req.body);

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const product = await stripe.products
        .retrieve(product_id)

        .then((product) => {
          res.json(product);
        })
        .catch((error) => {
          res.json(error);
        });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Internal server error",
      success: false,
      status: 500,
    });
  }
};

exports.delete_product_id = async (req, res) => {
  try {
    const { product_id } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        product_id: [Joi.string().empty().required()],
      })
    );

    const result = schema.validate(req.body);

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const deleted = await stripe.products
        .del(product_id)

        .then((deleted) => {
          res.json(deleted);
        })
        .catch((error) => {
          res.json(error);
        });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Internal server error",
      success: false,
      status: 500,
    });
  }
};

exports.get_product_all = async (req, res) => {
  try {
    const products = await stripe.products
      .list({ limit: 3 })

      .then((product) => {
        res.json(product);
      })
      .catch((error) => {
        res.json(error);
      });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Internal server error",
      success: false,
      status: 500,
    });
  }
};

exports.successfull_page = async (req, res) => {
  try {
    let id_1 = req.params.id;
    let user_id = req.params.user_id;

    console.log(">>>>>>", user_id);

    const inputString = id_1;
    const keyValuePairs = inputString.split("&");
    let idValue = null;

    for (const pair of keyValuePairs) {
      const [key, value] = pair.split("=");
      const cleanedKey = key.replace(":", ""); // Remove the colon from the key
      if (cleanedKey === "id") {
        idValue = value;
        break;
      }
    }

    console.log(">>>>>>>>>>>>>>>>", idValue);

    const payment_id = await add_payment(idValue, user_id);
    const update_status = await update_Status(user_id);

    res.sendFile(__dirname + "/view/successfull.html");
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Internal server error",
      success: false,
      status: 500,
    });
  }
};

exports.successfull_page_QR_code = async (req, res) => {
  try {
    let id_1 = req.params.id;
    let user_id = req.params.user_id;
    let product_id = req.params.product_id;

    // console.log(">>>>>>", user_id)

    const inputString = id_1;
    const keyValuePairs = inputString.split("&");
    let payment_id = null;

    for (const pair of keyValuePairs) {
      const [key, value] = pair.split("=");
      const cleanedKey = key.replace(":", ""); // Remove the colon from the key
      if (cleanedKey === "id") {
        payment_id = value;
        break;
      }
    }

    // console.log(">>>>>>>>>>>>>>>>", payment_id);

    const Product = await fetch_product(product_id);
    // console.log(">>>>>>>>>>>>>>>>", Product);
    let QR_code = Product[0].QR_code_image;
    // console.log(">>>>>>>>>>>>>>>>", QR_code);
    const Payment_id = await add_payment_QRcode(
      payment_id,
      user_id,
      product_id
    );
    const update_QRCode = await update_QRcode(user_id, product_id, QR_code);

    res.sendFile(__dirname + "/view/successfull.html");
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Internal server error",
      success: false,
      status: 500,
    });
  }
};

exports.cancel_page = async (req, res) => {
  try {
    let id_1 = req.params.id;
    let user_id = req.params.user_id;

    console.log(">>>>>>", user_id);

    const inputString = id_1;
    const keyValuePairs = inputString.split("&");
    let idValue = null;

    for (const pair of keyValuePairs) {
      const [key, value] = pair.split("=");
      const cleanedKey = key.replace(":", ""); // Remove the colon from the key
      if (cleanedKey === "id") {
        idValue = value;
        break;
      }
    }

    console.log(">>>>>>>>>>>>>>>>", idValue);

    const payment_id = await add_payment_1(idValue);
    // const update_status = await update_Status(user_id)

    res.sendFile(__dirname + "/view/cancel.html");
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Internal server error",
      success: false,
      status: 500,
    });
  }
};

exports.subscription_create = async (req, res) => {
  try {
    const { product_id } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        product_id: [Joi.string().empty().required()],
      })
    );

    const result = schema.validate(req.body);

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const subscription = await stripe.subscriptions
        .create({
          customer: customer_id,
          items: [{ price: price_id }],
        })

        .then((subscription) => {
          res.json(subscription);
        })
        .catch((error) => {
          res.json(error);
        });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Internal server error",
      success: false,
      status: 500,
    });
  }
};

exports.create_checkout = async (req, res) => {
  try {
    //  const { subscription_id } = req.body;
    let user_id = req.params.user_id;

    const schema = Joi.alternatives(
      Joi.object({
        // subscription_id: [Joi.string().empty().required()],
        user_id: [Joi.number().empty().required()],
      })
    );

    const result = schema.validate({ user_id });

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const session = await stripe.checkout.sessions
        .create({
          // success_url: 'http://192.168.1.134:4000/view/successfull.html',
          success_url:
            "http://159.89.248.34:3000/successfull/:id={CHECKOUT_SESSION_ID}/" +  user_id,
          // success_url: 'http://192.168.1.134:4000/view/successfull.htmlid={CHECKOUT_SESSION_ID}',

          line_items: [
            { price: "price_1NEC2eFKunSOaPwDnj5gZC3Y", quantity: 1 },
          ],
          mode: "subscription",
        })

        .then(async (session) => {
          res.json(session);
        })
        .catch((error) => {
          res.json(error);
        });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Internal server error",
      success: false,
      status: 500,
    });
  }
};

exports.create_checkout_QR_code = async (req, res) => {
  try {
    // const { user_id } = req.body;
    let user_id = req.params.user_id;
    let product_id = req.params.product_id;

    const schema = Joi.alternatives(
      Joi.object({
        user_id: [Joi.number().empty().required()],
        product_id: [Joi.number().empty().required()],
      })
    );

    const result = schema.validate({ user_id, product_id });

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const purchase_qrcode = await Get_Purchase_Qrcode(product_id, user_id);
      console.log(">>>>>>>>>>>>>>>", purchase_qrcode);
      if (purchase_qrcode != 0) {
        return res.json({
          message: " You have already purchased this QR_code. ",
          success: true,
          status: 200,
        });
      } else {
        const product_info = await fetch_product(product_id);
        let price_id = product_info[0].strip_price_id;
        // console.log("product_info",product_info)
        // console.log("strip_price_id",product_info[0].strip_price_id)
        stripe.checkout.sessions
          .create({
            // success_url: 'http://192.168.1.134:4000/view/successfull.html',
            success_url:
              "http://192.168.1.134:4000/successfull/:id={CHECKOUT_SESSION_ID}/" +
              user_id +
              "/" +
              product_id,
            // success_url: 'http://192.168.1.134:4000/view/successfull.htmlid={CHECKOUT_SESSION_ID}',

            line_items: [
              // { price: 'price_1NEC2eFKunSOaPwDnj5gZC3Y', quantity: 1 },
              { price: price_id, quantity: 1 },
            ],
            mode: "payment",
          })

          .then(async (session) => {
            res.json(session);
          })
          .catch((error) => {
            res.json(error);
          });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Internal server error",
      success: false,
      status: 500,
    });
  }
};

exports.createCard = async (req, res) => {
  try {
    const { name, email, card_number, exp_month, exp_year, cvc, user_id } =
      req.body;

    const schema = Joi.alternatives(
      Joi.object({
        name: [Joi.string().empty().required()],
        email: [Joi.string().empty().required()],
        card_number: [Joi.string().empty().required()],
        exp_month: [Joi.number().empty().required()],
        exp_year: [Joi.number().empty().required()],
        cvc: [Joi.string().empty().required()],
        user_id: [Joi.number().empty().required()],
      })
    );

    const result = schema.validate(req.body);

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const token = await stripe.tokens.create({
        card: {
          number: card_number,
          exp_month: exp_month,
          exp_year: exp_year,
          cvc: cvc,
        },
      });

      console.log(token, ">>>>>>>>>>")
      console.log(token.card.fingerprint, ">>>>>>>>>>")

      const customer = await stripe.customers
        .create({
          email: email,
          name: name,
          card: token.id,
          description: "Stripe Card",
        })
        .then(async (customer) => {
          res.json(customer);
          let token_id = token.id;
          let fingerprint = token.card.fingerprint;
          let card_id = customer.default_source;
          let customer_id = customer.id;
          const save_card = await save_CARD(
            token_id,
            card_id,
            customer_id,
            user_id, fingerprint
          )
        })
        .catch((error) => {
          res.json(error);
        });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Internal server error",
      success: false,
      Error: error,
      status: 500,
    });
  }
};

exports.get_ALL_Card = async (req, res) => {
  try {
    const { user_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        user_id: [Joi.number().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const get_token = await get_token_by_id(user_id);
      const arr = [];
      const dublicate = [];
      if (get_token != 0) {
        for (var i = 0; i < get_token.length; i++) {
          const token = await stripe.tokens.retrieve(get_token[i].token_id);
          if (!dublicate.includes(token.card.fingerprint)) {
            arr.push(token);
            dublicate.push(token.card.fingerprint);
            console.log(token.card.fingerprint)
          }
        }
        return res.json({
          message: "Data get Successfull",
          success: true,
          data: arr,
          status: 200,
        });
      } else {
        return res.json({
          message: "No save card found",
          success: false,
          data: [],
          status: 200,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Internal server error",
      success: false,
      Error: error,
      status: 500,
    });
  }
};

exports.payment_with_save_card = async (req, res) => {
  try {
    const { user_id, product_id, token_id } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        user_id: [Joi.number().empty().required()],
        token_id: [Joi.string().empty().required()],
        product_id: [Joi.number().empty().required()],
      })
    );

    const result = schema.validate(req.body);

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const purchase_qrcode = await Get_Purchase_Qrcode(product_id, user_id);
      console.log(">>>>>>>>>>>>>>>", purchase_qrcode);
      if (purchase_qrcode != 0) {
        return res.json({
          message: " You have already purchased this QR_code. ",
          success: false,
          status: 200,
        });
      } else {
        const get_product_info = await getProductbyid(product_id);

        if (get_product_info != 0) {
          const get_customer = await get_token(token_id);
          if (get_customer != 0) {
            const charge = await stripe.charges.create({
              amount: get_product_info[0].price * 100,
              currency: "usd",
              customer: get_customer[0].customer_id,
              description: "test payment",
            });

            var customer_id = customer_id;
            var payment_id = charge.id;
            var QR_code = get_product_info[0].QR_code_image;

            if (charge.status === "succeeded") {
              const Payment_id = await add_payment_QRcode(
                payment_id,
                user_id,
                product_id
              );
              const update_QRCode = await update_QRcode(
                user_id,
                product_id,
                QR_code
              );

              return res.json({
                message: "Payment successful",
                payment: charge,
                success: true,
                status: 200,
              });
            } else {
              return res.json({
                message: "Payment Unsuccessful",
                payment: [],
                success: false,
                status: 200,
              });
            }
          } else {
            return res.json({
              message: "No save card found",
              payment: [],
              success: false,
              status: 200,
            });
          }
        } else {
          return res.json({
            message: "No product found",
            payment: [],
            success: false,
            status: 200,
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Internal server error",
      success: false,
      Error: error,
      status: 500,
    });
  }
};


exports.delete_Card = async (req, res) => {
  try {
    const { token_id, fingerprint } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        token_id: [Joi.string().empty().required()],
        fingerprint: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {

      const delete_CarD = await delete_card(token_id, fingerprint)
      return res.json({
        message: "Card deleted successfull",
        success: true,
        status: 200,
      })
    }

  } catch (error) {
    console.log(error);
    return res.json({
      message: "Internal server error",
      success: false,
      Error: error,
      status: 500,
    });
  }
};
