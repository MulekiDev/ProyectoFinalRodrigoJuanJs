let contenedorProductos = document.getElementById("contenedorProductos");
let buscador = document.getElementById("buscador");
let inputs = document.getElementsByClassName("input");
let carrito = [];
let total = 0;
let productos = [];

//cargo productos desde el archivo json usando ajax
function cargarProductos() {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      productos = JSON.parse(xhr.responseText);
      renderizarTarjetas(productos);
    }
  };
  xhr.open('GET', 'productos.json', true);
  xhr.send();
}

//agrego eventos a los elementos de categoría
for (const input of inputs) {
  input.addEventListener("click", filtrarPorCategoria);
}

// Agrego evento al buscador
buscador.addEventListener("input", filtrarPorNombre);

//filtro productos por categoría
function filtrarPorCategoria() {
  let filtros = Array.from(inputs).filter(input => input.checked).map(input => input.id);
  let arrayFiltrado = productos.filter(producto => filtros.includes(producto.categoria));
  renderizarTarjetas(arrayFiltrado.length > 0 ? arrayFiltrado : productos);
}

//filtro productos por nombre
function filtrarPorNombre() {
  let valorBuscador = buscador.value.toLowerCase(); // Convertir a minúsculas para mejorar el filtrado
  let arrayFiltrado = productos.filter(producto => producto.nombre.toLowerCase().includes(valorBuscador));
  renderizarTarjetas(arrayFiltrado);
}

// Renderizo tarjetas de productos
function renderizarTarjetas(arrayDeProductos) {
  contenedorProductos.innerHTML = "";
  arrayDeProductos.forEach((producto, i) => {
    let tarjeta = document.createElement("div");
    tarjeta.className = "tarjetaProducto";
    tarjeta.innerHTML = `
      <h1 class="tituloCards">${producto.nombre}</h1>
      <p>Categoría: ${producto.categoria}</p>
      <p>Precio: $${producto.precio}</p>
      <div class="imagen" style="background-image: url(${producto.img})"></div>
      <button class="comprar" data-producto-id="${producto.id}">COMPRAR</button>
    `;
    tarjeta.addEventListener("click", agregarAlCarrito);
    contenedorProductos.appendChild(tarjeta);
  });
}

// Agrego productos al carrito
function agregarAlCarrito(event) {
  let productoId = event.target.dataset.productoId;
  let producto = productos.find(producto => producto.id == productoId);

  if (producto) {
    let productoExistente = carrito.find(item => item.nombre === producto.nombre);

    if (productoExistente) {
      productoExistente.cantidad++;
      total += producto.precio;
    } else {
      productoExistente = { ...producto, cantidad: 1 };
      carrito.push(productoExistente);
      total += producto.precio;
    }

    guardarCarritoEnLocalStorage();
    renderizarCarrito();
  }
}

// Guardo el carrito en el Local Storage
function guardarCarritoEnLocalStorage() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
  localStorage.setItem('total', total);
}

// Cargo el carrito desde el Local Storage
function cargarCarritoDesdeLocalStorage() {
  const carritoGuardado = localStorage.getItem('carrito');
  const totalGuardado = localStorage.getItem('total');

  if (carritoGuardado) {
    carrito = JSON.parse(carritoGuardado);
    total = parseInt(totalGuardado) || 0;
    renderizarCarrito();
  }
}

// Renderizo el carrito de compras
function renderizarCarrito() {
  let carritoHTML = document.getElementById("carrito");
  carritoHTML.innerHTML = "";

  carrito.forEach(({ nombre, precio, cantidad }) => {
    let itemCarrito = document.createElement("div");
    itemCarrito.innerHTML = `Producto: ${nombre}, Precio: $${precio}, Cantidad: ${cantidad}`;
    carritoHTML.appendChild(itemCarrito);
  });

  let totalHTML = document.getElementById("total");
  totalHTML.innerHTML = `Total de la compra: $${total}`;
}

// Vacio el carrito
function vaciarCarrito() {
  carrito = [];
  total = 0;
  guardarCarritoEnLocalStorage();
  renderizarCarrito();
  document.getElementById("buscador").value = ""; //pongo en blanco el buscador
  renderizarTarjetas(productos); //Vuelvo a cargar las tarjetas para "volver al inicio"
  document.getElementById("programables").checked = false;  //Limpia los checkbox para "reiniciar" la busqueda al usuario
  document.getElementById("repuestos").checked = false;
  document.getElementById("autopartes").checked = false;
}

// Agrego evento al botón "Vaciar carrito"
let botonVaciarCarrito = document.getElementById("vaciarCarrito");
botonVaciarCarrito.addEventListener("click", vaciarCarrito);

// Finalizar la compra
function finalizarCompra() {
  if (carrito.length === 0) {
    mostrarMensaje("El carrito está vacío");
    return;
  }

  mostrarMensaje("Procesando pago", "info");

  //simula delay en el procesamiento de pago
  setTimeout(() => {
    vaciarCarrito();
    mostrarMensaje("¡Gracias por su compra!", "success");
  }, 1500);
  //---------------------------------------
}

//Evento a boton "pagar ahora"
let botonPagarAhora = document.getElementById("finalizarCompra");
botonPagarAhora.addEventListener("click", finalizarCompra);

//muestro mensaje error
function mostrarMensaje(mensaje, tipo = "error") {
  Swal.fire({
    icon: tipo,
    title: mensaje,
    showConfirmButton: true,
    timer: 1500
  });
}

// Evento al boton de generar ticket
let botonGenerarTicket = document.getElementById("generarTicket");
botonGenerarTicket.addEventListener("click", generarTicket);

function generarTicket() {
  //Verifico si el carrito esta vacío
  if (carrito.length === 0) {
    mostrarMensaje("El carrito está vacío.");
    return;
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  let tempHeight = 30;
  carrito.forEach(({ nombre, precio, cantidad }, index) => {
    tempHeight += 30;
  });
  const textoNoValidoComoFactura = "Documento no válido como factura";
  context.font = 'bold 18px Arial';
  const tamanioTextoNoValido = context.measureText(textoNoValidoComoFactura);
  const anchoTextoNoValido = tamanioTextoNoValido.width;
  tempHeight += tamanioTextoNoValido.actualBoundingBoxAscent + tamanioTextoNoValido.actualBoundingBoxDescent;

  // Aumenta el ancho de la imagen descargada
  const imageWidth = anchoTextoNoValido + 20; // Se agrega un margen adicional de 20px
  const altoImg = tempHeight + 20; // Se agrega un margen adicional de 20px

  // Establece las dimensiones del canvas según el contenido, incluyendo el texto "no valido como factura"
  const canvasWidth = imageWidth * 2; // duplico el ancho de la imagen
  const canvasHeight = altoImg; //mantengo la altura
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // vuelve a dibujar el contenido del carrito y el texto adicional en el canvas redimensionado
  context.font = '16px Arial';
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvasWidth, canvasHeight);
  context.fillStyle = '#000000';
  let yPos = 30;
  carrito.forEach(({ nombre, precio, cantidad }, index) => {
    context.fillText(`${nombre} - $${precio} - x${cantidad}`, 10, yPos);
    yPos += 30;
  });
  context.font = 'bold 18px Arial';
  context.fillStyle = '#ff0000';
  yPos += 20; //agrego espacio entre el contenido del carrito y el texto 
  context.fillText(textoNoValidoComoFactura, 10, yPos);

  //crea una img ajstada al contenido
  const image = new Image(imageWidth, altoImg);
  image.src = canvas.toDataURL('image/png');

  //crea la descarga
  const link = document.createElement('a');
  link.href = image.src;
  link.download = 'ticketCompraRJStore.png';
  link.click();
}

//Cargo los productos desde el archivo JSON al cargar la página
cargarProductos();

// Cargo el carrito desde el Local Storage al cargar la página
cargarCarritoDesdeLocalStorage();
