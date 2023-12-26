use std::ops::Add;
use std::slice::Iter;

#[derive(Debug, Clone, Eq, PartialEq)]
pub struct Record {
    inner: Vec<(Object, Object)>
}

impl Record {
    pub fn new() -> Self {
        Self{inner:vec![]}
    }

    pub fn insert(&mut self, key: Object, value: Object) {
        self.inner.push((key, value));
    }

    pub fn get(&self, key: &Object) -> Option<&Object> {
        self.inner.iter().find(|(obj_key, _)| key == obj_key).map(|(k, v)| v)
    }
}

#[derive(Debug, Clone, Eq, PartialEq)]
pub enum Object {
    Null,
    Boolean(bool),
    Number(f64),
    String(String),
    Array(Vec<Self>),
    Record(Record),
    Function(fn(Vec<Object>) -> Object),
}

impl Object {
    pub fn unwrap_boolean_or_default(&self) -> bool {
        match self {
            Self::Boolean(b) => *b,
            Self::Number(num) => *num != 0,
            Self::String(string) => string.is_empty(),
            _ => false,
        }
    }

    pub fn iter(&self) -> Iter<Object> {
        match self {
            Self::Array(array) => array.iter(),
            _ => panic!(""),
        }
    }

    pub fn call(&self, args: Vec<Object>) -> Object {
        match self {
            Self::Function(func) => func(args),
            obj => panic!("{:?} is not callable", obj),
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
