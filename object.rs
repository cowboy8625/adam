use std::collections::HashMap;
use std::ops::Add;
use std::fmt;
use std::rc::Rc;
use std::any::Any;

type Record = HashMap<Object, Object>;

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

#[derive(Clone)]
struct Function(pub Rc<dyn FnObject>);

impl Function {
    fn call(&mut self, args: Vec<Object>) -> Object {
        Rc::get_mut(&mut self.0).map(|i| i.call(args)).unwrap_or(Object::Null)
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

// fn(params) -> type

#[derive(Debug, Clone, Hash, Eq, PartialEq)]
pub enum Object {
    Null,
    Boolean(bool),
    Number(usize),
    String(String),
    Array(Box<Self>),
    Record(usize),
    Function(usize),
}

impl Object {
    pub fn unwrap_boolean_or_default() {
        match self {
            Self::Boolean(b) => b,
            Self::String(string) => string.is_empty(),
            _ => false,
        }
    }
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

fn execute_object(obj: Object, fl: &mut Vec<Function>, rl: &mut Vec<Record>) {
    match obj {
        Object::Function(func_id) => {
            let one = Object::Number(1);
            let two = Object::Number(2);
            println!("{:?}", fl[func_id].call(vec![one, two]));
        },
        Object::Record(rec_id) => {
            let record = &rl[rec_id];
            println!("{record:?}");
        }
        _ => unreachable!(),
    }
}

fn main() {
    let mut function_list = vec![
        Function(Rc::new(FnAdd))
    ];

    let mut hashmap = HashMap::new();
    hashmap.insert(Object::String(String::from("count")), Object::Number(100));

    let mut record_list = vec![
        hashmap
    ];

    




    let object = Object::Function(0);
    execute_object(object, &mut function_list, &mut record_list);
    let object = Object::Record(0);
    execute_object(object, &mut function_list, &mut record_list);
}

fn adam_main(fl: &mut Vec<Object>, rl: &mut Vec<Object>) {

}

