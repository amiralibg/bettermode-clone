import { useState, FormEvent } from "react";
import { gql, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setAuthToken } from "@/lib/apollo";

const SIGNUP_MUTATION = gql`
  mutation JoinNetwork($input: JoinNetworkInput!) {
    joinNetwork(input: $input) {
      accessToken
      refreshToken
    }
  }
`;

interface SignupFormData {
  name: string;
  email: string;
  password: string;
}

interface SignupErrors {
  name?: string;
  email?: string;
  password?: string;
  general?: string;
}

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<SignupErrors>({});

  const [joinMember, { loading }] = useMutation(SIGNUP_MUTATION, {
    onCompleted: (data) => {
      if (data.joinNetwork?.accessToken) {
        // Store the token
        setAuthToken(data.joinNetwork.accessToken);

        // Store user data
        localStorage.setItem(
          "userData",
          JSON.stringify(data.joinNetwork.member),
        );

        // Redirect to home page
        navigate("/");
      }
    },
    onError: (error) => {
      console.error("Signup error:", error);
      setErrors({
        general:
          error.message || "An unexpected error occurred. Please try again.",
      });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: SignupErrors = {};

    if (!formData.name) {
      newErrors.name = "Name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof SignupErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await joinMember({
        variables: {
          input: {
            name: formData.name,
            email: formData.email,
            password: formData.password,
          },
        },
      });
    } catch (error) {
      // Error handling is done in onError callback
      console.log(error);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl">So You Want to Join Us?</CardTitle>
        <CardDescription>Sign up to join our community</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>

          {errors.general && (
            <p className="text-red-500 text-sm text-center">{errors.general}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing up..." : "Sign up"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <p className="text-gray-500">
            you already have an account?
            <a href="/auth/login" className="text-primary hover:underline">
              log in
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default Signup;
