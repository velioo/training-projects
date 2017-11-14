var cartSchema = {
  "type": "object",
  "properties": {
	"count": { "type": "integer", "minimum": 0 },
	"price_leva": { "type": "number", "minimum": 0 },
  }, 
  "required": [ "count", "price_leva"]
};

var cartChangeQuantitySchema = {
  "type": "object",
  "properties": {
	"quantity": { "type": "integer", "minumum": 1 },
	"price_leva": { "type": "number", "minimum": 1 },
  }, 
  "required": [ "quantity", "price_leva"]
};

var menuItemsSchema = {
	"type": "array",
	"items": {
		"type": "object",
		"properties": {
			"id": { "type": "integer", "minimum": 1 },
			"name": { "type": "string" },
			"c_type": { "type": "integer", "minimum": 1, "maximum": 3 },
		},
		"required": [ "id", "name", "c_type" ]	
	}
};
