# Adam Language

Adam is a high-level programming language that aims to combine simplicity, versatility, and performance. It is designed to be intuitive and easy to learn while providing powerful features for building a wide range of applications. One of its distinctive features is that it compiles to Rust code, leveraging Rust's performance and safety.

## Hello World

```rust
fn main() {
    print("Hello, world!");
}
```

The above example demonstrates a simple "Hello, World!" program in Adam. Despite its simplicity, Adam is capable of handling more complex tasks and offers a syntax that is both concise and expressive.

## Key Features

- **Simplicity:** Adam is designed to be easy to understand and learn. Its syntax is clean and concise, making it accessible to beginners while providing experienced developers with a productive environment.

- **Versatility:** Adam is a dynamic language that supports a wide range of programming paradigms. Whether you are building web applications, command-line tools, or system-level software, Adam provides the flexibility to adapt to your needs.

- **Performance:** By compiling to Rust, Adam inherits the performance and safety features of Rust. This allows developers to write high-performance code without sacrificing safety and memory management.

## Getting Started

To start using Adam, follow these steps:

1. **Install the Adam Compiler:**
   - ```bash
   $ git clone https://github.com/cowboy8625/adam
   $ cd adam
   ```

2. **Write Your First Program:**
   - Create a new Adam source file, for example, `hello.adam`.
   - Write your code using Adam syntax.

     ```rust
     fn main() {
         print("Hello, Adam!");
     }
     ```

3. **Compile the Program:**
   - Open your terminal and navigate to the directory containing your `hello.adam` file.
   - Run the Adam compiler to generate the corresponding Rust code.

     ```bash
     $ deno run src/main.ts -- <filename>
     ```

4. **Build and Run the Rust Code:**
   - Use `rustc` to compile the generated Rust code.

     ```bash
     rustc <filename> -o <filename>
     ```

   - Run the compiled Rust binary.

     ```bash
     ./<filename>
     ```

## Documentation

For more detailed information on the Adam language and its features, refer to the [official Adam documentation](https://github.com/cowboy8625/adam).

## Contributing

Contributions to the Adam language are welcome! If you have ideas for improvements, bug reports, or would like to contribute to the development of Adam, please check our [contribution guidelines](CONTRIBUTING.md).

## License

Adam is released under the [MIT License](LICENSE), making it free and open-source software. Feel free to use, modify, and distribute Adam in accordance with the terms of the license.
