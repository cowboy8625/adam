use std::collections::HashMap;
use std::ops::Add;
use std::fmt;
use std::rc::Rc;
use std::any::Any;
use std::hash::{Hash, Hasher};

trait FnObject: fmt::Debug {
    fn call(&mut self, args: Vec<Object>) -> Object;
    fn equal(&self, other: &dyn FnObject) -> bool;
    fn as_any(&self) -> &dyn Any;
}

#[derive(Debug, PartialEq)]
struct FnAdd;
impl FnObject for FnAdd {
    fn call(&mut self, args: Vec<Object>) -> Object {
        args[0].clone() + args[1].clone()
    }
    fn equal(&self, other: &dyn FnObject) -> bool {
        other.as_any().downcast_ref::<Self>().map_or(false, |i| self==i)
    }
    fn as_any(&self) -> &dyn Any {
        self
    }
}

impl Hash for dyn FnObject {
    fn hash<H: Hasher>(&self, state: &mut H) {
    }
}

#[derive(Clone, Hash)]
struct Function(pub Rc<dyn FnObject>);

impl Function {
    fn call(&mut self, args: Vec<Object>) -> Object {
        self.0.call(args)
    }
}

impl std::fmt::Debug for Function {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self.0)
    }
}

impl PartialEq for Function {
    fn eq(&self, other: &Self) -> bool {
        self.0.equal(&*other.0)
    }
}

impl Eq for Function {}



#[derive(Debug, Clone, Hash, Eq, PartialEq)]
enum Object {
    Null,
    Number(usize),
    String(String),
    Array(Box<Self>),
    Record(HashMap<Self, Self>),
    Function(Function),
}

impl Add for Object {
    type Output = Object;

    fn add(self, rhs: Self) -> Self::Output {
        match (self, rhs) {
            (Object::Number(lhs), Object::Number(rhs)) => Object::Number(lhs + rhs),
            (Object::String(lhs), Object::String(rhs)) => Object::String(format!("{lhs}{rhs}")),
            _ => panic!("invalid op"),
        }
    }
}


fn main() {
    let object = Object::Function(
        Function(
            Rc::new(FnAdd)
        )
    );
    let one = Object::Number(1);
    let two = Object::Number(2);

    match object {
        Object::Function(Function(func)) => println!("{:?}", func.call(vec![one, two])),
        _ => unreachable!(),
    }

    let mut hashmap = HashMap::new();
    hashmap.insert(Object::String(String::from("count")), Object::Number(100));
    let record = Object::Record(hashmap);
    println!("{record:?}")
}
