import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, HttpException } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller("order")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Res() response: Response) {

    let hasFinishOrder =  await this.orderService.hasFinishOrder(createOrderDto.order_id);
    let hasPendingOrder = await this.orderService.hasPendingOrder(createOrderDto.order_id);

    if(hasFinishOrder==0){
       if(hasPendingOrder>0){        
        let getPendingOrder = await this.orderService.getPendingOrder(createOrderDto.order_id);
        let order_id = getPendingOrder.order_id;
        createOrderDto.order_id = order_id;
        let insert = await this.orderService.create(createOrderDto);
        return response.status(HttpStatus.OK).send({
            statusCode: HttpStatus.OK,
            message: 'Success added order id :'+order_id,
            data: insert
          });
       }else{
          let insert = await this.orderService.create(createOrderDto);
          return response.status(HttpStatus.OK).send({
            statusCode: HttpStatus.OK,
            message: 'Success place new order',
            data: insert
          });
       }      
    }else{
      throw new HttpException("Order ID not found", HttpStatus.BAD_REQUEST);      
    }
  }

  @Get("menu")
  async getAllMenu(@Res() response: Response) {
    let menu = await this.orderService.findAll();
    return response.status(HttpStatus.OK).send({
      statusCode: HttpStatus.OK,
      message: 'list of menu',
      data: menu
    });
  }

  //@Get()
  //findAll() {
  //  return this.menuService.findAll();
 // }

 @Get('food/:id')
async findFood(@Param('id') id: number, @Res() response: Response) {
    let food = await this.orderService.getFood(+id);
    if(food != null){
      return response.status(HttpStatus.OK).send({
        statusCode: HttpStatus.OK,
        message: 'success',
        data: food
      });
    }else{
      throw new HttpException("Menu doesn't exist", HttpStatus.BAD_REQUEST);
    }
   
  }

  @Get(':id')
  async findAllOrder(@Param('id') id: string, @Res() response: Response) {
    let orders = await this.orderService.findAllOrder(+id);
    
    if(orders.length>0){
      return response.status(HttpStatus.OK).send({
        statusCode: HttpStatus.OK,
        message: 'success',
        data: orders
      });
    }else{
      throw new HttpException("No order data", HttpStatus.BAD_REQUEST);
    }
    
  }

  @Get('status/:id')
  async findOrderStatus(@Param('id') id: string,  @Res() response: Response) {
    let statusOrder = await this.orderService.findOrderStatus(+id);
    if(statusOrder != null){
      return response.status(HttpStatus.OK).send({
        statusCode: HttpStatus.OK,
        message: 'success',
        data: {'status':statusOrder.state}
      });
    }else{
      throw new HttpException("No order data", HttpStatus.BAD_REQUEST);
    }
    
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete('cancel/:id')
  async remove(@Param('id') id: string, @Res() response: Response) {
    let deleted = await this.orderService.remove(+id);
    if(deleted.count > 0){
      return response.status(HttpStatus.OK).send({
        statusCode: HttpStatus.OK,
        message: 'successfully canceled the order'
      });
    }else{
      throw new HttpException("Order does not exist or has been processed cannot be canceled", HttpStatus.BAD_REQUEST);
    }
    
  }
}
