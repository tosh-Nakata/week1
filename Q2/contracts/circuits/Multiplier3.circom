pragma circom 2.0.0;

// [assignment] Modify the circuit below to perform a multiplication of three signals

//define multiplier2 
template Multiplier2 () {
   signal input x;
   signal input y;
   signal output z;
   z <==  x * y;
}

template Multiplier3 () {  

   // Declaration of signals.  
   signal input a;  
   signal input b;
   signal input c;
   signal output d;  
   component node1 = Multiplier2();
   component node2 = Multiplier2();
   // Constraints.  
   node1.x <== a;
   node1.y <== b;
   node2.x <== node1.z;
   node2.y <== c;
   d <== node2.z;

}

component main = Multiplier3();