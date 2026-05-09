package com.dormitory.bedmanagement.service;

import com.dormitory.bedmanagement.dto.CustomerDTO;
import com.dormitory.bedmanagement.entity.Customer;
import com.dormitory.bedmanagement.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {
    
    private final CustomerRepository customerRepository;
    
    public List<CustomerDTO> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public CustomerDTO getCustomerById(Long id) {
        return customerRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
    }
    
    public CustomerDTO getCustomerByEmail(String email) {
        return customerRepository.findByEmail(email)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Customer not found with email: " + email));
    }
    
    public List<CustomerDTO> searchCustomers(String search) {
        return customerRepository.searchCustomers(search).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public CustomerDTO createCustomer(CustomerDTO customerDTO) {
        Customer customer = Customer.builder()
                .firstName(customerDTO.getFirstName())
                .lastName(customerDTO.getLastName())
                .email(customerDTO.getEmail())
                .phone(customerDTO.getPhone())
                .idProofType(customerDTO.getIdProofType())
                .idProofNumber(customerDTO.getIdProofNumber())
                .address(customerDTO.getAddress())
                .build();
        
        return convertToDTO(customerRepository.save(customer));
    }
    
    @Transactional
    public CustomerDTO updateCustomer(Long id, CustomerDTO customerDTO) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        
        customer.setFirstName(customerDTO.getFirstName());
        customer.setLastName(customerDTO.getLastName());
        customer.setEmail(customerDTO.getEmail());
        customer.setPhone(customerDTO.getPhone());
        customer.setIdProofType(customerDTO.getIdProofType());
        customer.setIdProofNumber(customerDTO.getIdProofNumber());
        customer.setAddress(customerDTO.getAddress());
        
        return convertToDTO(customerRepository.save(customer));
    }
    
    @Transactional
    public void deleteCustomer(Long id) {
        customerRepository.deleteById(id);
    }
    
    private CustomerDTO convertToDTO(Customer customer) {
        return CustomerDTO.builder()
                .id(customer.getId())
                .firstName(customer.getFirstName())
                .lastName(customer.getLastName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .idProofType(customer.getIdProofType())
                .idProofNumber(customer.getIdProofNumber())
                .address(customer.getAddress())
                .build();
    }
}
