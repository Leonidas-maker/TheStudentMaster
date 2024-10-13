from operator import xor as xor_
from functools import reduce

###########################################################################
########################## Basic logic functions ##########################
###########################################################################

# Function to perform XOR operation on multiple arguments
def xor(*args) -> bool:
    return reduce(xor_, map(bool, args))


# Function to check if only one argument is True
def only_one(*args) -> bool:
    return sum(map(bool, args)) == 1
