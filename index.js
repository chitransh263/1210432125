const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const NodeCache = require('node-cache');
const app = express();
// const port = 3000;


async function fetchProductsFromCompany(companyApiUrl, category) {
    try {
      const response = await axios.get(`${companyApiUrl}/categories/${category}/products`);
      return response.data.products.map(product => ({
        ...product,
        custom_id: uuidv4()  // Generate unique ID for each product
      }));
    } catch (err) {
      console.error(`Error fetching products from ${companyApiUrl}`,err);
      return [];
    }
  }

app.get('http://20.244.56.144/test/companies/:companyName/categories/:categoryname/products', async(req, res)=>{
    const {categoryname} = req.params;
    const { n = 10, page = 1, sort = 'price', order='asc'} = req.query;
    const companies = [
        "AMZ","FLP","SNP","MYN","AZO"
    ];

    let products = productCache.get(categoryname);
    if(!products){
        const allProducts = await Promise.all(companies.map(company => fetchProductsFromCompany(company, categoryname)));
        products = allProducts.flat();

        productCache.set(categoryname, products);
    }
        products.sort((a,b)=>{
            if(order=='asc') return a[sort] - b[sort];
            return b[sort] - a[sort];
        });


        //Pagenation
        const startIndex = (page - 1)*n;
        const paginatedProducts = products.slice(startIndex, startIndex+parseInt(n));
        res.json({
            page : parseInt(page),
            totalProducts : products.length,
            products : paginatedProducts
        });
    
});

app.get('http://20.244.56.144/test/companies/:companyName/categories/:categoryname/products/:productid', async (req, res) => {
    const { categoryname, productid } = req.params;
      const products = productCache.get(categoryname);
  
    if (products) {
      const product = products.find(p => p.custom_id === productid);
      if (product) {
        return res.json(product);
      }
    }
      res.status(404).json({ message: 'Product not found' });
  });
  
//   app.listen(3000,()=>{});

