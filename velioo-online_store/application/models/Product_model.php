<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Product_model extends CI_Model {

     function __construct() {
        $this->tableName = 'products';
     }

     function getRows($params = array()) {
		 
		if(array_key_exists("custom", $params)) {
			
			$query = $this->db->query($params['custom']);			
			return $query->result_array();
			
		} else {
		
			if(array_key_exists("select", $params)) {
				 $this->db->select($params['select']);          
			} else {
				 $this->db->select('*');
			}
		   
			
			if(array_key_exists("table", $params)) {
				$this->db->from($params['table']);
			} else {
				$this->db->from($this->tableName);
			}             			
			
			if(array_key_exists("joins", $params)) {
				foreach ($params['joins'] as $key => $value) {
					if(is_array($value)) {
						$this->db->join($key, $value[0], $value[1]);
					} else {
						$this->db->join($key, $value);
					}
					
				}
			}
			
			if(array_key_exists("id", $params)) {
				$this->db->where('id', $params['id']);
				$query = $this->db->get();
				$result = $query->row_array();
			} else {
				
				if(array_key_exists("conditions", $params)) {
					foreach ($params['conditions'] as $key => $value) {
						$this->db->where($key, $value);
					}
				}
				
				if(array_key_exists("where_in", $params)) {
					foreach ($params['where_in'] as $key => $value) {
						$this->db->where_in($key, $value);
					}
				}
				
				if(array_key_exists("like", $params)) {
					foreach ($params['like'] as $key => $value) {
						if(!is_array($value)) {
							$this->db->like($key, $value);
						} else {
							$this->db->like($key, $value[0], $value[1]);
						}
						
					}
				}
				
				if(array_key_exists("or_like", $params)) {
					foreach ($params['or_like'] as $key => $value) {
						if(!is_array($value)) {
							$this->db->or_like($key, $value);
						} else {
							$this->db->or_like($key, $value[0], $value[1]);
						}
						
					}
				}

				if(array_key_exists("order_by", $params)) {
					foreach ($params['order_by'] as $key => $value) {
						$this->db->order_by($key, $value);
					}
				}   
				
				if(array_key_exists("group_by", $params)) {
					$this->db->group_by($params['group_by']);
				} 

				if(array_key_exists("start", $params) && array_key_exists("limit", $params)) {
					$this->db->limit($params['limit'], $params['start']);
				} elseif(!array_key_exists("start", $params) && array_key_exists("limit", $params)) {
					$this->db->limit($params['limit']);
				}
				
				$query = $this->db->get();
				
				if(array_key_exists("returnType", $params) && $params['returnType'] == 'count') {
					$result = $query->num_rows();
				} elseif(array_key_exists("returnType", $params) && $params['returnType'] == 'single') {
					$result = ($query->num_rows() > 0) ? $query->row_array() : FALSE;
				} else{
					$result = ($query->num_rows() > 0) ? $query->result_array() : FALSE;
				}
			}
			//echo $this->db->last_query();die();
			return $result;
		}

        
    }
    
	public function insert($data = array(), $tableName=null) {
		  		
		if($tableName === null)
			$insert = $this->db->insert($this->tableName, $data);
		else
			$insert = $this->db->insert($tableName, $data);
		
		if($insert) {
			return ($this->db->insert_id()) ? $this->db->insert_id() : true;
		} else{
			return false;
		}
	}
    
    public function update($params = array()) {
		
		if(array_key_exists("conditions", $params)) {
            foreach ($params['conditions'] as $key => $value) {
                $this->db->where($key, $value);
            }
        }
        
        if(array_key_exists("set", $params)) {
            $update = $this->db->update($this->tableName, $params['set']);
            return $update;
        } else {
			return FALSE;
		}       
		
	}
	
	public function delete($params = array()) {
		
		if(array_key_exists("conditions", $params)) {
            foreach ($params['conditions'] as $key => $value) {
                $this->db->where($key, $value);
            }
        }
        
        if(array_key_exists("id", $params)) {
            $this->db->where('id', $params['id']);
            $delete = $this->db->delete($this->tableName);
            return $delete;
        } else {
			return FALSE;
		}  
	}


}
?>
